/**
 * Base service class, to establish a standard when creating the services
 */
export class BaseService {
	protected COLLECTION_NAME: string;

	public constructor(collectionName: string) {
		this.COLLECTION_NAME = collectionName;
	}
}
