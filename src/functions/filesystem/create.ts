import {DataMapper} from "@aws/dynamodb-data-mapper";
import {Mapper} from "../../utils/mapper";
import {Document} from "../../models/document";
import {DocType} from "../../models/document.type";
import {AwsLambda, RestApiEvent, RestApiOutput, toLambda} from "../../utils/lambda";

interface ICreateDocument {
    documentName: string;
    parentFolder: string;
    date: number;
    type: DocType;
}

interface ICreateDocumentResp {
    sucessfull: boolean;
    reason?: string;
}

/**
 * Try to create a new document in the database
 */
class CreateDocument extends AwsLambda<ICreateDocument, ICreateDocumentResp> {
    public async perform(input: RestApiEvent<ICreateDocument>): Promise<RestApiOutput<ICreateDocumentResp>> {
        const mapper: DataMapper = Mapper.Instance;

        const query: Document = new Document();

        if (!input.body) {
            return this.responseBuilder(500, {
                sucessfull: false,
                reason: 'No input parameters were provided'
            });
        }

        if (!input.body.documentName) {
            return this.responseBuilder(500, {
                sucessfull: false,
                reason: 'Document name was not provided!'
            });
        }

        if (input.body.type === undefined) {
            return this.responseBuilder(500, {
                sucessfull: false,
                reason: 'Invalid document type'
            });
        }

        // Use root folder if none was provided
        if (input.body.parentFolder === undefined) {
            input.body.parentFolder = '';
        }

        const parentFolderName = this.CurrentUserName + input.body.parentFolder;

        query.name = parentFolderName;
        let parentFolder: Document | undefined = undefined;

        // Check if the parent exists and is a folder
        try {
            parentFolder = await mapper.get<Document>(query);
            if (parentFolder.type === DocType.DOC_FILE) {
                return this.responseBuilder(500, {
                    sucessfull: false,
                    reason: 'The selected parent document is a file, not a folder'
                });
            }
        } catch (e) {
            // Folder does not exist
            return this.responseBuilder(500, {
                sucessfull: false,
                reason: 'The selected folder does not exist.'
            });
        }



        // Check document name
        if (input.body.documentName.includes('/')) {
            return this.responseBuilder(500, {
                sucessfull: false,
                reason: 'The folder contains invalid characters'
            });
        }

        query.name += `/${input.body.documentName}`;

        // Check if the document exists
        try {
            await mapper.get<Document>(query);
            return this.responseBuilder(500, {
                sucessfull: false,
                reason: 'The file already exists'
            });
        } catch (e) {
            // File does not exist
        }

        query.type = input.body.type;
        query.created = new Date(input.body.date);
        query.parent = parentFolderName;

        if (!!parentFolder) {
            if (!!parentFolder.children) {
                parentFolder.children.add(input.body.documentName);
            } else {
                parentFolder.children = new Set<string>(); // [query.name];
                parentFolder.children.add(input.body.documentName);
            }

            await Mapper.Instance.update(parentFolder);
        }

        try {
            await mapper.put(query);
        } catch (e) {
            return this.responseBuilder(500, {
                sucessfull: false,
                reason: JSON.stringify(e)
            });
        }

        return this.responseBuilder(200, {
            sucessfull: true
        });
    }
}

export const create = toLambda(new CreateDocument());
