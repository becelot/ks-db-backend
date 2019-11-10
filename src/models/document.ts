import {attribute, hashKey, rangeKey, table} from "@aws/dynamodb-data-mapper-annotations";
import {DocType} from "./document.type";

@table('ks-db-documents')
export class Document {
    @hashKey()
    name: string;

    @attribute({defaultProvider: () => new Date()})
    created: Date;

    @attribute({type: 'Number'})
    type: DocType;

    @attribute({defaultProvider: () => ''})
    parent: string;

    @attribute()
    content?: string;

    @attribute({memberType: 'String'})
    children: Set<string>;
}
