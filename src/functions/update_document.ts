import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../utils/lambda";
import {Document} from "../models/document";
import {Mapper} from "../utils/mapper";
import {DocType} from "../models/document.type";

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
        if (input.body.path === undefined) {
            return this.responseBuilder(500, {
                successful: false,
                error: 'Document path was not provided'}
            );
        }

        // Get document
        const userName = this.CurrentUserName;
        const query: Document = new Document();
        query.name = userName + (input.body.path === '' ? '' : '/' + input.body.path);

        const document: Document = await Mapper.Instance.get(query);

        if (document.type !== DocType.DOC_FILE) {
            return this.responseBuilder(500, {
                successful: false,
                error: 'Document was not a text file'}
            );
        }

        document.content = input.body.content;

        await Mapper.Instance.update(document);

        return this.responseBuilder(200, {
            successful: true
        });
    }
}

export const update_document = toLambda(new UpdateDocument());
