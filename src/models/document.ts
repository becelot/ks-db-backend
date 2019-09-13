import {attribute, hashKey, rangeKey, table} from "@aws/dynamodb-data-mapper-annotations";
import {DocType} from "./document.type";
import {StringType} from "@aws/dynamodb-data-marshaller/build/SchemaType";
import {embed} from "@aws/dynamodb-data-mapper";

@table('ks-db-documents')
export class Document {
    @hashKey()
    name: string;

    @rangeKey({defaultProvider: () => new Date()})
    created: Date;

    @attribute()
    type: DocType;

    @attribute()
    content?: string;

    @attribute({memberType: 'String'})
    children?: string[];
}
