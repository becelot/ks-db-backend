import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../../utils/lambda";
import {AWSAccess, SSO} from "../../models/SSO";
import {Mapper} from "../../utils/mapper";

interface GetAccountsResponse {
    error?: string;
    ACL?: AWSAccess[];
}

class Accounts extends AwsLambda<{}, GetAccountsResponse> {
    async perform(input: RestApiEvent<{}>): Promise<RestApiOutput<GetAccountsResponse>> {

        const username: string = this.CurrentUserName;

        let sso: SSO;
        try {
            sso = await Mapper.Instance.get(Object.assign(new SSO(), {user: username}))
        } catch (e) {
            return this.responseBuilder(500, {
                error: 'No accounts were found for the logged in user',
                ACL: []
            });
        }


        return this.responseBuilder(200, {
            ACL: JSON.parse(JSON.stringify(sso.ACL)) as AWSAccess[]
        });
    }

}

export const get_accounts = toLambda(new Accounts());
