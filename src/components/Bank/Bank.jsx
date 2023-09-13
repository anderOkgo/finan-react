import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DataService from '../../services/data.service';
import { moneyFormat } from '../../helpers/operations';

export default function Bank({ setInit, init, setProc, proc }) {
  Bank.propTypes = {
    setInit: PropTypes.func.isRequired,
    init: PropTypes.any,
    setProc: PropTypes.func.isRequired,
    proc: PropTypes.any,
  };
  const [bankTotal, setBankTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setProc(true);
      if (init) {
        let resp = await DataService.totalBank();
        resp.err ? setInit(false) : setBankTotal(resp[0] === undefined ? 0 : resp[0].total_bank) & setInit(true);
      }
      setProc(false);
    };

    fetchData();
  }, [init]);

  return (
    <div className="label-bank">
      {proc && <p> &#9201;</p>}
      {init ? <p> &#128293;</p> : <p> &#10060;</p>} ToataBank: {moneyFormat(bankTotal)}
    </div>
  );
}
