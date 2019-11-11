import {attribute, hashKey, table} from "@aws/dynamodb-data-mapper-annotations";

@table('ks-db-aws-accounts')
export class AwsAccount {
    @hashKey()
    account: number;

    @attribute()
    displayName: string;
}
