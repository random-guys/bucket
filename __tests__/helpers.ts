import faker from "faker";
import lodash from "lodash";
import { Test } from "supertest";

/**
 * Is list of value generators(static and dynamic) and their weight.
 * The weight is used to calculate the probabilty of the generator being
 * used.
 */
export type Choices = [() => any | any, number][];

export interface Session {
  workspace?: string;
  user?: string;
  security_key?: string;
  [key: string]: any;
}

/**
 * Run this function after `duration` wrapping the entire delay
 * in a promise. This is useful for testing workers as it would
 * take some time to send and receive messages, as well as an
 * event queue break to handle the message
 * @param fn function to run tests or anything you want...do your
 * worst
 */
export function delayed(fn: () => Promise<void>, duration = 500) {
  return new Promise(resolve => {
    setTimeout(async () => {
      await fn();
      resolve(true);
    }, duration);
  });
}

export function timeout(duration = 500) {
  return delayed(() => Promise.resolve(), duration);
}

/**
 * Generate multiple version using a mock data function.
 * @param n number of values to generate
 * @param fn mock data function
 */
export function multiply<T = any>(n: number, fn: () => T): T[] {
  const results: T[] = [];

  for (let i = 0; i < n; i++) {
    results.push(fn());
  }

  return results;
}

/**
 * Run async job `fn` `n` times sequentially.
 * @param n number of times to run it
 * @param fn job to run
 */
export async function repeat(n: number, fn: () => Promise<any>): Promise<any[]> {
  const jobs = Array.from({ length: n });
  const results = [];

  for (const _ of jobs) {
    results.push(await fn());
  }

  return results;
}

/**
 * Map over an data using an async function.
 * @param data to map over
 * @param fn map function
 */
export async function mapAsync<T = any>(data: T[], fn: (t: T) => Promise<any>): Promise<any[]> {
  return Promise.all(data.map((t: T) => fn(t)));
}

/**
 * Create n instances of an object with `data` merged into all of them. Note that it will
 * replace the values of keys directlt
 * @param n number of instances to create
 * @param fn factory function
 * @param data data to merge into the instances
 */
export function merge<T = any>(n: number, fn: () => T, data: any): T[] {
  return Array.from({ length: n }).map(() => {
    return { ...fn(), ...data };
  });
}

/**
 * Like `merge`, but it does a partial update to each instance. So it's possible to
 * only update one key in a nested object for instance.
 * @param n number of instances to create
 * @param fn factory function
 * @param data data to merge into the instances
 */
export function partialMerge<T = any>(n: number, fn: () => T, data: any): T[] {
  return Array.from({ length: n }).map(() => {
    const result = fn();
    const updatePaths = objectPaths(data);

    Object.keys(updatePaths).forEach(path => {
      // @ts-ignore
      lodash.set(result, path, updatePaths[path]);
    });

    return result;
  });
}

/**
 * Create a basic user session with possible extra properties(e.g. user permissions)
 * @param extras extra permissions an session properties
 */
export function createSession(extras = {}): Session {
  return {
    workspace: faker.random.uuid(),
    user: faker.random.uuid(),
    security_key: faker.random.uuid(),
    ...extras
  };
}

/**
 * Create a user session with accounts attached to the user.
 * @param account account to attach to the session
 * @param minimum minimum amount for the account
 * @param maximum maximum amount allowed on the account
 * @param extras extra permissions an session properties
 */
export function createSessionWithAccounts(account: string, minimum: number, maximum: number, extras = {}) {
  return {
    workspace: faker.random.uuid(),
    user: faker.random.uuid(),
    ...extras,
    accounts: [
      {
        account_number: account,
        min_amount: minimum,
        max_amount: maximum
      }
    ]
  };
}

/**
 * Create a fake OTP
 */
export function createOTPToken() {
  return faker.finance.account(6);
}

/**
 * Pick a random value based on the choice configurations
 * @param items choice configurations. See `Choices`
 */
export function randomise(...items: Choices) {
  const choices: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const [val, size] = items[i];
    let fn = typeof val === "function" ? val : () => val;

    choices.push(...multiply(size, fn));
  }

  return faker.random.arrayElement(choices);
}

/**
 * Return the data stored in the body of the response based on jsend format
 * @param test test that generates the response
 */
export async function getResponse<T = any>(test: Test): Promise<T> {
  const response = await test;
  return response.body.data as T;
}

/**
 * Return the message for the failed test request based on jsend format
 * @param test test that generates the response
 */
export async function getError(test: Test): Promise<string> {
  const response = await test;
  return response.body.message;
}

/**
 * Print formatted JSON string of an object.
 * @param data object to print
 */
export async function prettyPrint(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

function objectPaths(data: any) {
  const entries = {};

  setPath(data, entries);
  return entries;

  function setPath(data: any, entries: object, key = "") {
    if (typeof data !== "object" || data == null) {
      entries[key] = data;
    } else {
      Object.keys(data).forEach(k => {
        const parentKey = key !== "" ? `${key}.${k}` : k;
        setPath(data[k], entries, parentKey);
      });
    }
  }
}