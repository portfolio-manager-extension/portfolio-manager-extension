import StorageFactory from "../../../../../storage/StorageFactory";
import { RawMessagesDataDirector } from "./RawMessagesDataDirector";
import { RawMessagesDataBuilder } from "./RawMessagesDataBuilder";

export async function getRawMessagesData(
  account: Extension.Account,
  options: App.YourData.RawMessagesDataOptions
): Promise<App.YourData.RawMessagesData> {
  const director = new RawMessagesDataDirector(
    StorageFactory.makeMessageRepository(account),
    new RawMessagesDataBuilder()
  );

  // const timelines = sortByTimestampAsc(await storageFactory.makeTimelineRepository(account).getAll())
  // // const regex = /([0-9\.,]+)\s?([A-Z]{3})/gm;
  // const regex = /([0-9\.,]+)(\s?)([A-Z]{3})?/gm;
  // for (const timeline of timelines) {
  //   if (typeof timeline.body['en'] !== 'undefined') {
  //     testRegex(regex, timeline.body['en'], timeline)
  //   }
  //
  //   if (typeof timeline.body['de'] !== 'undefined') {
  //     testRegex(regex, timeline.body['de'], timeline)
  //   }
  // }

  return director.make(account, options);
}

export function getEmptyRawMessagesData(): App.YourData.RawMessagesData {
  return {
    items: [],
    duplicated: 0,
    filteredStatus: undefined,
    filteredType: undefined,
    types: new Map(),
    statuses: new Map(),
  };
}

// function testRegex(regex: RegExp, body: string, timeline: ProcessedEntity.Timeline) {
//   if (regex.test(body)) {
//     const matches = body.match(regex)
//
//     // @ts-ignored
//     console.log(timeline.type, body, matches, timeline.cashChangeAmount)
//   }
// }
