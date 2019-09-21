import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../utils/lambda";

interface IUpdateDocument {
    path: string;
    content: string;
}

interface IUpdateDocumentResponse {
    successful: boolean;
    error?: string;
}


class UpdateDocument extends AwsLambda<IUpdateDocument, IUpdateDocumentResponse> {
    async perform(input: RestApiEvent<IUpdateDocument>): Promise<RestApiOutput<IUpdateDocumentResponse>> {
        return this.responseBuilder(200, {
            successful: false,
            error: 'Not implemented yet'
        });
    }
}

export const update_document = toLambda(new UpdateDocument());
