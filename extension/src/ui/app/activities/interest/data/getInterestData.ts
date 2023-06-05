import InterestDataDirector from "./InterestDataDirector";
import InterestDataBuilder from "./InterestDataBuilder";
import StorageFactory from "../../../../../storage/StorageFactory";

export async function getInterestData(account: Extension.Account) {
  const director = new InterestDataDirector(
    StorageFactory.makeTimelineRepository(account),
    StorageFactory.makeTimelineDetailRepository(account),
    StorageFactory.makeCustomInterestRepository(account),
    new InterestDataBuilder()
  );

  return director.make(account);
}
