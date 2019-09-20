import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../utils/lambda";

interface IDocContents {
    document: string;
}

interface IDocContentsResp {
    content: string;
}

class DocumentContent extends AwsLambda<IDocContents, IDocContentsResp> {
    async perform(input: RestApiEvent<IDocContents>): Promise<RestApiOutput<IDocContentsResp>> {
        return this.responseBuilder(200, {
            content: 'demo content'
        });
    }

}

export const content = toLambda(new DocumentContent());
