import {DataMapper} from "@aws/dynamodb-data-mapper";
import {DynamoDB} from "aws-sdk";

export class Mapper {
    private static _instance: Mapper;

    private _mapper: DataMapper;

    private constructor() {
        this._mapper = new DataMapper({
            client: new DynamoDB({region: 'us-east-1'})
        })
    }

    public static get Instance(): DataMapper {
        if (!this._instance) {
            this._instance = new Mapper();
        }

        return this._instance._mapper;
    }
}
