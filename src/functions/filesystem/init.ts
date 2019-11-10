import {AwsLambda, RestApiOutput, toLambda} from "../../utils/lambda";
import {APIGatewayProxyEvent} from "aws-lambda";
import {Mapper} from "../../utils/mapper";
import {Document} from "../../models/document";
import {DocType} from "../../models/document.type";


class InitDatabase extends AwsLambda<{}, {}> {
    async perform(input: Omit<APIGatewayProxyEvent, "body"> & { body: {} }): Promise<RestApiOutput<{}>> {
        await Mapper.Instance.put(Object.assign(new Document(), { name: 'Becelot', type: DocType.DOC_FOLDER, children: ['Angular']}));
        await Mapper.Instance.put(Object.assign(new Document(), { name: 'Becelot/Angular', type: DocType.DOC_FOLDER, parent: 'Becelot', children: ['Login']}));
        await Mapper.Instance.put(Object.assign(new Document(), { name: 'Becelot/Angular/Login', type: DocType.DOC_FOLDER, parent: 'Becelot/Angular'}));
        return this.responseBuilder(200, {});
    }
}

export const init = toLambda(new InitDatabase());
