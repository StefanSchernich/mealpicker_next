import FilterOptionRadios from "@/components/atoms/FilterOptionRadios";
import { ReactNode } from "react";

type RadioFilterSectionProps = {
  children: ReactNode;
  sectionName: string;
  state: string;
  dataArr: {
    id: number;
    value: string;
    icon: string;
  }[];
  changeHandler: any;
  isRequired: boolean;
};

export default function RadioFilterSection({
  children,
  sectionName,
  state,
  dataArr,
  changeHandler,
  isRequired,
}: RadioFilterSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold">{children}</p>
      <div className="flex gap-6">
        {dataArr.map(({ id, value, icon }) => {
          return (
            <FilterOptionRadios
              key={id}
              sectionName={sectionName}
              state={state}
              value={value}
              icon={icon}
              changeHandler={changeHandler}
              isRequired={isRequired}
            />
          );
        })}
      </div>
    </div>
  );
}
