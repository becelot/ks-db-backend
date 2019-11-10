import {attribute, hashKey, table} from "@aws/dynamodb-data-mapper-annotations";
import {getSchema} from "@aws/dynamodb-data-mapper";
import {marshallItem, unmarshallItem} from "@aws/dynamodb-data-marshaller";


function AWSAccessMarshaller(input: any) {
    if (isAccount(input)) {
        return { M: marshallItem(getSchema(AWSAccessAccount.prototype), input) };
    } else if (isGroup(input)) {
        return { M: marshallItem(getSchema(AWSAccessGroup.prototype), input) };
    }

    return { S: 'Error' };
}

function AWSAccessUnmarshaller(input: any) {
    switch (input.M.type.N) {
        case AWSAccessType.AWS_ACCESS_ACCOUNT.toString():
            return Object.assign(new AWSAccessAccount(), unmarshallItem(getSchema(AWSAccessAccount.prototype), input.M));
        case AWSAccessType.AWS_ACCESS_GROUP.toString():
            return Object.assign(new AWSAccessGroup(), unmarshallItem(getSchema(AWSAccessGroup.prototype), input.M));
    }
    return unmarshallItem(getSchema(AWSAccess.prototype), input.M);
}

export enum AWSAccessType {
    AWS_ACCESS_UNDEFINED,
    AWS_ACCESS_GROUP,
    AWS_ACCESS_ACCOUNT
}

export class AWSAccess {
    @attribute({type: 'Number'})
    type: AWSAccessType;

    @attribute()
    description?: string;
}

export class AWSAccessGroup extends AWSAccess {
    constructor () {
        super();
        this.type = AWSAccessType.AWS_ACCESS_GROUP;
    }

    @attribute()
    groupName?: string;

    @attribute({memberType: { type: 'Custom', marshall: AWSAccessMarshaller, unmarshall: AWSAccessUnmarshaller}})
    ACL?: Array<AWSAccess>;
}

export function isGroup(access: AWSAccess): access is AWSAccessGroup {
    return access.type === AWSAccessType.AWS_ACCESS_GROUP;
}

export class AWSAccessAccount extends AWSAccess {
    constructor () {
        super();
        this.type = AWSAccessType.AWS_ACCESS_ACCOUNT;
    }

    @attribute()
    account: number;
}

export function isAccount(access: AWSAccess): access is AWSAccessAccount {
    return access.type === AWSAccessType.AWS_ACCESS_ACCOUNT;
}

@table('ks-db-sso')
export class SSO {
    @hashKey()
    user: string;

    @attribute({memberType: { type: 'Custom', marshall: AWSAccessMarshaller, unmarshall: AWSAccessUnmarshaller}})
    ACL: Array<AWSAccess>;
}
