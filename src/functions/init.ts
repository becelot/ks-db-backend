import {AwsLambda, RestApiOutput, toLambda} from "../utils/lambda";
import {APIGatewayProxyEvent} from "aws-lambda";
import {Mapper} from "../utils/mapper";
import {Document} from "../models/document";


class InitDatabase extends AwsLambda<{}, {}> {
    async perform(input: Omit<APIGatewayProxyEvent, "body"> & { body: {} }): Promise<RestApiOutput<{}>> {
        await Mapper.Instance.put(Object.assign(new Document(), { name: 'Becelot'}))
        return this.responseBuilder(200, {});
    }
}

export const init = toLambda(new InitDatabase());
