/**
 * Result gotten from a pagination query
 */
export interface PaginationQueryResult<T> {
  /**
   * The current page of results
   */
  page: number;

  /**
   * The number of documents returned in each page
   */
  per_page: number;

  /**
   * Sort order in which the documents are returned. Defaults to `created_at`
   */
  sort: string | object;

  /**
   * Array of found documents
   */
  result: T[];
}

/**
 * A repository query that specifies pagination options
 */
export interface PaginationQuery {
  /**
   * Whether to return deleted files
   */
  archived?: boolean | string;

  /**
   * MongoDB query object
   */
  conditions: any;

  /**
   * The current page of results.  Defaults to 1 (the `1st`) page
   */
  page?: number;

  /**
   * The number of documents returned in each page. Defaults to `20` documents
   */
  per_page?: number;

  /**
   * Specifies which document fields to include or exclude
   */
  projections?: any;

  /**
   * Sort order in which the documents are returned. Defaults to `created_at`
   */
  sort?: string | object;
}

/**
 * Repository query object
 */
export interface Query {
  /**
   * MongoDB query object
   */
  conditions?: object;

  /**
   * Specifies which document fields to include or exclude
   */
  projections?: string | object;

  /**
   * Sort order in which the documents are returned. Defaults to `created_at`
   */
  sort?: string | object;

  /**
   * Whether to return deleted files
   */
  archived?: boolean | string;
}
