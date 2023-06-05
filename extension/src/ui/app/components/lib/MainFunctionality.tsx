import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  loading: boolean;
  hasData: boolean;
  noDataComponent: React.ComponentElement<any, any>;
};
export default function MainFunctionality({ loading, hasData, noDataComponent, children }: Props) {
  if (loading) {
    return (
      <div>
        <i className="fa fa-spin fa-spinner"></i>
      </div>
    );
  }
  if (hasData) {
    return <>{children}</>;
  }
  return <>{noDataComponent}</>;
}
