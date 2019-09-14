import {DataMapper} from "@aws/dynamodb-data-mapper";
import {DynamoDB} from "aws-sdk";

export class Mapper {
    private static _instance: Mapper;

    private _mapper: DataMapper;

    private constructor() {
        this._mapper = new DataMapper({
            client: process.env.IS_OFFLINE ? new DynamoDB({
                region: "localhost",
                endpoint: "http://localhost:8000"
            }) : new DynamoDB({region: 'us-east-1'})
        })
    }

    public static get Instance(): DataMapper {
        if (!this._instance) {
            this._instance = new Mapper();
        }

        return this._instance._mapper;
    }
}
