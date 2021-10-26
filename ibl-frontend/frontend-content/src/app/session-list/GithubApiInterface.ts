import { GithubIssue } from "./GithubIssueInterface";

export interface GithubApi {
    records: GithubIssue[];
    records_count: number;
  }