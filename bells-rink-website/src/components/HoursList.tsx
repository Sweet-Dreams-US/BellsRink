import React from 'react';
import { useHours, weekSummary } from '../lib/hours';

type Props = {
  /** Class for each day row; the footer and the contact page style theirs differently. */
  rowClassName: string;
};

/** The week at a glance: one row per open day, then the days with no session. */
const HoursList: React.FC<Props> = ({ rowClassName }) => {
  const { open, closed } = weekSummary(useHours());

  return (
    <>
      {open.map(({ day, ranges }) => (
        <div className={rowClassName} key={day}>
          <span>{day}:</span>
          <span>
            {ranges.map((range, index) => (
              <React.Fragment key={`${index}-${range}`}>
                {index > 0 && <br />}
                {range}
              </React.Fragment>
            ))}
          </span>
        </div>
      ))}
      {open.length > 0 && closed.length > 0 && (
        <div className={`${rowClassName} closed`}>
          <span>{closed.map((day) => day.slice(0, 3)).join(', ')}:</span>
          <span>Closed</span>
        </div>
      )}
      {open.length === 0 && (
        <div className={rowClassName}>
          <span>Call (260) 749-8214 for current hours</span>
        </div>
      )}
    </>
  );
};

export default HoursList;
