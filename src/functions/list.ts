import {AwsLambda, RestApiEvent, RestApiOutput} from "../utils/lambda";
import {DocType} from "../models/document.type";

interface IListDocuments {
    folder: string;
}

interface IListDocumentsResp {
    documents: Array<{
        name: string;
        type: DocType;
    }>;
}

class ListDocuments extends AwsLambda<IListDocuments, IListDocumentsResp> {
    async perform(input: RestApiEvent<IListDocuments>): Promise<RestApiOutput<IListDocumentsResp>> {
        return this.responseBuilder(200, {
            documents: []
        });
    }
}
