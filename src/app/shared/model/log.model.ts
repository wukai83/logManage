import { Moment } from 'moment';
import { BaseModel } from './base.model';

export class PostLoginInfoModel extends BaseModel {
    url: string;
    time: Moment;
    ip: string;
    traceId: string;
    userId: string;
}

export class LoadUserApiInfoModel extends BaseModel {
    time: Moment;
    userId: string;
    traceId: string;
}

export class GetLoginErrorInfoModel extends BaseModel {
    url: string;
    time: Moment;
    ip: string;
    traceId: string;
}
