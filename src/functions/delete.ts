import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../utils/lambda";
import {Document} from "../models/document";
import {Mapper} from "../utils/mapper";

interface IDeleteDocument {
    path: string;
}

interface IDeleteDocumentResponse {
    successful: boolean;
    error?: string;
}

/**
 * Endpoint that allows users to delete their documents
 */
class DeleteDocument extends AwsLambda<IDeleteDocument, IDeleteDocumentResponse> {

    /**
     * Extracts the parent folder from a given string
     * @param path
     */
    private getPathInfo(path: string): [string, string] {
        const index: number = path.lastIndexOf('/');

        // if the path contains a '/'
        if (index < 0) {
            throw new Error('Ill-formed path');
        }

        return [path.slice(0, index), path.slice(index + 1, path.length)];
    }

    async perform(input: RestApiEvent<IDeleteDocument>): Promise<RestApiOutput<IDeleteDocumentResponse>> {

        // Check input parameters
        if (!input.body.path) {
            return this.responseBuilder(500, {
                successful: false,
                error: 'Could not delete the root directory'
            });
        }

        let fileInfo: [string, string];
        try {
            fileInfo = this.getPathInfo(this.CurrentUserName + input.body.path);
        } catch (e) {
            return this.responseBuilder(500, {
                successful: false,
                error: 'Path was invalid'
            });
        }

        // Check, if document exists
        let document: Document = Object.assign(new Document(), {name: this.CurrentUserName + input.body.path});
        try {
            document = await Mapper.Instance.get(document);
        } catch (e) {
            return this.responseBuilder(500, {
                successful: false,
                error: 'Document could not be found'
            });
        }

        // Check if parent still exists
        let parent: Document;
        try {
            parent = Object.assign(new Document(), {name: fileInfo[0]});
            parent = await Mapper.Instance.get(parent);
        } catch (e) {
            return this.responseBuilder(500, {
                successful: false,
                error: 'Parent folder could not be found: ' + e.message
            });
        }

        if (!parent.children.delete(fileInfo[1])) {
            return this.responseBuilder(500, {
                successful: false,
                error: 'Could not delete reference ' + fileInfo[1] + ' from folder ' + fileInfo[0]
            });
        }

        await Mapper.Instance.update(parent);
        await Mapper.Instance.delete(document);

        return this.responseBuilder(200, {
            successful: true
        });
    }

}

export const delete_doc = toLambda(new DeleteDocument());
