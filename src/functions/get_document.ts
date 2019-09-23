import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../utils/lambda";
import {Document} from "../models/document";
import {Mapper} from "../utils/mapper";
import {DocType} from "../models/document.type";

interface IGetDocument {
    path: string;
}

interface IGetDocumentResp {
    successful: boolean;
    type?: DocType;
    error?: string;
}

interface IGetDocumentFolderResponse extends IGetDocumentResp {
    documents: Array<{
        name: string;
        type: DocType;
    }>;
}

interface IGetDocumentTextResponse extends IGetDocumentResp {
    content: string;
}

type IGetDocumentResponse = IGetDocumentFolderResponse | IGetDocumentTextResponse;


class GetDocument extends AwsLambda<IGetDocument, IGetDocumentResponse> {
    async perform(input: RestApiEvent<IGetDocument>): Promise<RestApiOutput<IGetDocumentResponse>> {
        if (input.body.path === undefined) {
            return this.responseBuilder(500, {
                successful: false,
                documents: [],
                error: 'Document path was not provided'}
            );
        }

        const userName = this.CurrentUserName;

        const query: Document = new Document();
        query.name = userName + input.body.path;

        let parent: Document;
        try {
            parent = await Mapper.Instance.get(query);
        } catch (e) {
            return this.responseBuilder(500, {
                successful: false,
                documents: [],
                error: 'Document does not exist on the server'
            });
        }


        // if the document is a folder, prepare a folder reply
        if (parent.type === DocType.DOC_FOLDER) {
            if (!parent.children) {
                parent.children = new Set<string>();
            }

            // Extract children
            const docs: Array<{
                name: string;
                type: DocType;
            }> = [];


            for (let child of parent.children) {
                try {
                    const res = await Mapper.Instance.get(Object.assign(new Document(), {name: parent.name + '/' + child}));
                    docs.push({
                        name: child,
                        type: res.type
                    });
                } catch (e) {
                    console.log(`[ERROR] Directory ${parent.name} for user ${this.CurrentUserName} contains a reference to ${child} that was not resolvable!`);
                }

            }

            return this.responseBuilder(200, {
                successful: true,
                type: DocType.DOC_FOLDER,
                documents: docs
            });
        } else if (parent.type === DocType.DOC_FILE) {
            // if the document is a file
            return this.responseBuilder(200, {
                successful: true,
                type: DocType.DOC_FILE,
                content: !!parent.content ? parent.content : ''
            });
        }

        return this.responseBuilder(500, {
            successful: false,
            documents: [],
            error: 'Document type could not be processed'
        });
    }

}

export const get_document = toLambda(new GetDocument());
