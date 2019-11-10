import {hashKey, table} from "@aws/dynamodb-data-mapper-annotations";

@table('ks-db-sso')
export class SSO {
    @hashKey()
    user: string;
}
