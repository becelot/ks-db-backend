import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../../utils/lambda";
import {DocType} from "../../models/document.type";
import {Document} from "../../models/document";
import {Mapper} from "../../utils/mapper";

interface IListDocuments {
    folder: string;
}

interface IListDocumentsResp {
    successful: boolean;
    documents: Array<{
        name: string;
        type: DocType;
    }>;
    error?: string;
}

class ListDocuments extends AwsLambda<IListDocuments, IListDocumentsResp> {
    async perform(input: RestApiEvent<IListDocuments>): Promise<RestApiOutput<IListDocumentsResp>> {
        if (input.body.folder === undefined) {
            return this.responseBuilder(500, {
                successful: false,
                documents: [],
                error: 'Folder does not exist'}
                );
        }

        const userName = this.CurrentUserName;

        const query: Document = new Document();
        query.name = userName + (input.body.folder === '' ? '' : '/' + input.body.folder);
        console.log(query.name);

        const parent: Document = await Mapper.Instance.get(query);
        if (parent.type === DocType.DOC_FOLDER) {
            if (!parent.children) {
                parent.children = new Set<string>();
            }

            const children: string[] = [];
            parent.children.forEach(child => children.push(child));


            const docs: Array<{
                name: string;
                type: DocType;
            }> = [];


            for (let child of children) {
                const res = await Mapper.Instance.get(Object.assign(new Document(), {name: parent.name + '/' + child}));
                docs.push({
                    name: child,
                    type: res.type
                });
            }

            return this.responseBuilder(200, {
                        successful: true,
                        documents: docs
                    });
        }

        return this.responseBuilder(200, {
            successful: true,
            documents: []
        });
    }
}

export const list = toLambda(new ListDocuments());
