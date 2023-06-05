import React, { useRef } from "react";
import Form from "react-bootstrap/Form";
import NumberField from "../../components/form/NumberField";
import OffcanvasBlock from "../../components/lib/OffcanvasBlock";
import DisplayedField from "../../components/form/DisplayedField";
import FormUtilities from "../../fn/FormUtilities";
import StorageFactory from "../../../../storage/StorageFactory";
import OffcanvasBlockDelete from "../../components/lib/OffcanvasBlockDelete";
import { SOLIDARITY_SURCHARGE, CAPITAL_GAINS } from "../../../../const";

type Props = {
  account: Extension.Account;
  item: App.Activity.InterestItem;
  entity?: CustomEntity.Interest;
  onSaved?: (item: App.Activity.InterestItem, entity: CustomEntity.Interest) => void;
  onDeleted?: (item: App.Activity.InterestItem, entity: CustomEntity.Interest) => void;
};

async function saveEntity(
  account: Extension.Account,
  item: App.Activity.InterestItem,
  averageBalance: number,
  interestRate: number,
  capitalGainsTax: number,
  solidaritySurcharge: number
): Promise<CustomEntity.Interest> {
  const repository = StorageFactory.makeCustomInterestRepository(account);
  const entity: CustomEntity.Interest = {
    id: item.id, // id should match ProcessedEntity.Timeline | App.Activity.InterestItem
    type: "interest",
    tax: {
      details: {
        [CAPITAL_GAINS]: {
          text: "Capital gains tax",
          type: CAPITAL_GAINS,
          amount: {
            value: capitalGainsTax,
            currency: account.defaultCurrency,
          },
        },
        [SOLIDARITY_SURCHARGE]: {
          text: "Solidarity surcharge",
          type: SOLIDARITY_SURCHARGE,
          amount: {
            value: solidaritySurcharge,
            currency: account.defaultCurrency,
          },
        },
      },
      total: {
        value: capitalGainsTax + solidaritySurcharge,
        currency: account.defaultCurrency,
      },
    },
    // TODO: add taxBase to custom form
    taxBase: { value: 0, currency: account.defaultCurrency },
    averageBalance: { value: averageBalance, currency: account.defaultCurrency },
    interestRate: interestRate,
    amount: { value: item.amount.value, currency: item.amount.currency },
    timestamp: Date.now(),
  };

  await repository.save(entity);
  return entity;
}

function getTaxDetails(entity: CustomEntity.Interest | undefined, key: string): string {
  if (typeof entity === "undefined") {
    return "0";
  }
  const detail = entity.tax.details[key];
  if (typeof detail === "undefined") {
    return "0";
  }
  return detail.amount.value.toString();
}

export default function InterestForm({ account, item, entity, onSaved, onDeleted }: Props) {
  const avgBalance = useRef<UI.FieldRef<number>>(null);
  const interestRate = useRef<UI.FieldRef<number>>(null);
  const capitalGainsTax = useRef<UI.FieldRef<number>>(null);
  const solidaritySurcharge = useRef<UI.FieldRef<number>>(null);
  const fields: UI.FieldRefList = [avgBalance, interestRate, capitalGainsTax, solidaritySurcharge];

  async function onSubmit(e: any) {
    e.preventDefault();
    if (FormUtilities.isValid(fields)) {
      const entity = await saveEntity(
        account,
        item,
        avgBalance.current!.getValue(),
        interestRate.current!.getValue(),
        capitalGainsTax.current!.getValue(),
        solidaritySurcharge.current!.getValue()
      );
      if (typeof onSaved !== "undefined") {
        onSaved.call(undefined, item, entity);
      }
    }
  }

  async function onDeleteRequest() {
    if (typeof entity === "undefined") {
      return;
    }
    const repository = StorageFactory.makeCustomInterestRepository(account);
    await repository.deleteById(entity.id);
    if (typeof onDeleted !== "undefined") {
      onDeleted.call(undefined, item, entity);
    }
  }

  return (
    <Form id="interest-form" className="align-right-form" onSubmit={onSubmit}>
      <OffcanvasBlock text="Overview">
        <DisplayedField text="Asset" value="Cash" />
        <NumberField
          ref={avgBalance}
          id="interest-avg-balance"
          text="Avg Balance"
          name="averageBalance"
          required
          defaultValue={typeof entity !== "undefined" ? entity.averageBalance.value.toString() : ""}
          min={0}
          step={0.01}
        />
        <NumberField
          ref={interestRate}
          id="interest-rate"
          text="Interest rate p.a."
          name="interestRate"
          required
          lock
          min={0}
          defaultValue={typeof entity !== "undefined" ? entity.interestRate.toString() : "2.00"}
          step={0.01}
          symbol="percent"
        />
        <DisplayedField text="Total" value={item.amount.text} total />
      </OffcanvasBlock>

      <OffcanvasBlock text="Settlement">
        <DisplayedField text="Tax base" value={item.amount.text} />
        <NumberField
          ref={capitalGainsTax}
          id="interest-capital-gains-tax"
          text="Capital gains tax"
          name="capitalGainsTax"
          required
          defaultValue={getTaxDetails(entity, "capitalGains")}
          min={0}
          step={0.01}
        />
        <NumberField
          ref={solidaritySurcharge}
          id="interest-solidarity-surcharge"
          text="Solidarity surcharge"
          name="solidaritySurcharge"
          required
          defaultValue={getTaxDetails(entity, "solidarity")}
          step={0.01}
        />
        <DisplayedField text="Total" value={item.amount.text} total />
      </OffcanvasBlock>
      <OffcanvasBlockDelete show={typeof entity !== "undefined"} onDeleteRequest={onDeleteRequest} />
    </Form>
  );
}
