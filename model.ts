import {crudState} from "../COMMON/crud";
import {Template,TemplateForm} from "../search-templates/model";
import {Account} from "../accounts/model";

export enum STATUS {
    DRAFT = "0", // "Draft"
    ACTION_PROCESSING = "1", // "Action processing"
    INFRASTRUCTURE_DEPLOYMENT = "10", // "Infrastructure deployment"
    INFRASTRUCTURE_DEPLOYED = "11", // "Infrastructure deployed"
    RUN = "20", // "Run",
    INFRASTRUCTURE = "30", // "Infrastructure disabling"
    INFRASTRUCTURE_DESABLED = "31", // "Infrastructure disabled"
    INFRASTRUCTURE_DESABLED_FAILD = "32", // "Infrastructure disable failed"
    FAILED = "76", // "Failed"
    COMPLETED = "77", // "Completed"
    STOPPED = "78" // "Stopped"
}

export interface Campaign {
  id: string,
  name: string,
  qty: number,
  concurrency: number,
  relay_account_id: number,
  start_after_save: boolean,
  settings: TemplateForm[]
  created_at: number
  deleted_at: number
  found: number
  infrastructure: any
  proxies: any
  status: STATUS
  status_description: string
  updated_at: number
  user_id: number
  wh_secret: string
  // NEW 
  cookies?: string,
  relations: {
    owner:any,
    relayAccount:Account,
    statusLogs:any,
    events: Event[],
  };
}

export interface Event{
    api_version: string;
    created_at: number;
    data: any;
    id: string;
    is_ok: true
    livemode: false
    object: string;
    relations: {tries: []}
    tries_count: number;
    tries_max: number;
    type: EVENT_TYPE
    updated_at: number;
}

export enum EVENT_TYPE {
  COMPLETED = "campaign.completed",
  CREATED = "campaign.created",
  FOUND = "campaign.found",
  RUN = "campaign.run",
  WORKER_ERROR = "worker.error",
  PAGE_ERROR = "page.error",
  CLUSTER_ERROR = "cluster.error",
  CAMPAIGN_DEPRECATED = "campaign.deprecated",
}

export const EVENT_TYPE_VALUE = {
    [EVENT_TYPE.COMPLETED]: 'Completed',
    [EVENT_TYPE.CREATED]: 'Created',
    [EVENT_TYPE.FOUND]: 'Found',
    [EVENT_TYPE.RUN]: 'Run',
    [EVENT_TYPE.CAMPAIGN_DEPRECATED]: 'Deprecated',
}

export interface Worker{
    cluster: number;
    id: number;
    uniqID: string
}

export interface Found{
    cluster: number;
    id: number;
    uniqID: string
}

export interface CampaignsState extends crudState<Campaign> {}
