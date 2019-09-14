import {DataMapper} from "@aws/dynamodb-data-mapper";
import {Mapper} from "../utils/mapper";
import {Document} from "../models/document";
import {DocType} from "../models/document.type";

export const create = async (event: any, context: any) => {
    const mapper: DataMapper = Mapper.Instance;
    const document: Document = new Document();
    document.name = 'TestFolder';
    document.children = [];
    document.type = DocType.DOC_FOLDER;

    await mapper.put(document);

    return {
        statusCode: '200',
        body: 'Created folder'
    }
};
