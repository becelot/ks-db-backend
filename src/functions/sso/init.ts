import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../../utils/lambda";
import {AWSAccessAccount, AWSAccessGroup, SSO} from "../../models/SSO";
import {Mapper} from "../../utils/mapper";


export class InitSSO extends AwsLambda<{}, {}> {
    async perform(input: RestApiEvent<{}>): Promise<RestApiOutput<{}>> {
        const awsEducate = new AWSAccessGroup();
        awsEducate.groupName = 'AWSEducate';
        awsEducate.description = 'Manages accounts registered inside the AWSEducate account';

        const awsAccount: AWSAccessAccount = new AWSAccessAccount();
        awsAccount.account = 383747644106;

        awsEducate.ACL = [ awsAccount ];


        const sso: SSO = new SSO();
        sso.user = 'Becelot';
        sso.ACL = [
            awsEducate
        ];

        await Mapper.Instance.put(sso);

        const query: SSO = new SSO();
        query.user = 'Becelot';

        const result: SSO = await Mapper.Instance.get(query);

        return this.responseBuilder(200, {});
    }
}

export const init = toLambda(new InitSSO());
