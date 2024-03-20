declare type Collections = {
    [path: string]: {
        key: [string, string | undefined];
    }[];
};
/**
 * Collection cache
 *
 * This helps us keep track of which collections have been created.
 *
 * Whenever we edit a document, we then check the collection cache to see which collections we should also update.
 */
declare class CollectionCache {
    private collections;
    constructor();
    getSWRKeysFromCollectionPath(path: string): (string | undefined)[][];
    addCollectionToCache(path: string, queryString?: string): Collections;
}
export declare const collectionCache: CollectionCache;
export {};
