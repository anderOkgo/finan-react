import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LineChart from '../LineChart';
import GlobalContext from '../../../contexts/GlobalContext';

// jsdom's canvas can't meaningfully render chart.js -- per this repo's own
// Phase 0b/2.5 notes, the right isolation strategy is stubbing
// react-chartjs-2's Line component to a lightweight placeholder that
// exposes exactly the props it received (mirrored into a data-testid div
// via JSON.stringify, the same "expose data through the mock" convention
// already used by every other Table-mocking test in this repo), then
// asserting on LineChart.jsx's *own* logic: the year filter/sort and the
// getVar/resolveColors CSS-variable-to-chart-color pipeline.
vi.mock('react-chartjs-2', () => ({
  Line: (props) => <div data-testid="line-mock">{JSON.stringify(props)}</div>,
}));

const t = (key) => key;

const dataI = [
  { year_number: 2022, month_number: 1, month_name: 'jan', incomes: 100, expenses: 50 },
  { year_number: 2023, month_number: 5, month_name: 'may', incomes: 200, expenses: 80 },
  { year_number: 2024, month_number: 3, month_name: 'mar', incomes: 300, expenses: 90 },
  { year_number: 2024, month_number: 1, month_name: 'jan', incomes: 10, expenses: 5 },
];

const readLineProps = () => JSON.parse(screen.getByTestId('line-mock').textContent);

const renderChart = (props = {}, contextValue = { isDarkMode: false }) =>
  render(
    <GlobalContext.Provider value={contextValue}>
      <LineChart dataI={dataI} height={300} t={t} {...props} />
    </GlobalContext.Provider>
  );

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2024, 5, 15)); // fixes "current year" to 2024 for the mount effect

  // Stand in for the real theme CSS custom properties LineChart's
  // getVar/resolveColors effect reads via getComputedStyle -- jsdom
  // doesn't load the app's real stylesheets, so these must be set directly
  // on the root element for the effect to have anything real to resolve.
  const root = document.documentElement;
  root.style.setProperty('--chart-incomes', 'rgb(1, 2, 3)');
  root.style.setProperty('--chart-expenses', 'rgb(4, 5, 6)');
  root.style.setProperty('--text-body', '#111111');
  root.style.setProperty('--border-subtle', '#222222');
  root.style.setProperty('--white-alpha-90', 'rgba(1, 1, 1, 0.9)');
  root.style.setProperty('--white-alpha-10', 'rgba(2, 2, 2, 0.1)');
  root.style.setProperty('--white-alpha-20', 'rgba(3, 3, 3, 0.2)');
  root.style.setProperty('--black-alpha-10', 'rgba(5, 5, 5, 0.1)');
  root.style.setProperty('--black-alpha-20', 'rgba(6, 6, 6, 0.2)');
});

afterEach(() => {
  vi.useRealTimers();
  const root = document.documentElement;
  ['--chart-incomes', '--chart-expenses', '--text-body', '--border-subtle', '--white-alpha-90', '--white-alpha-10', '--white-alpha-20', '--black-alpha-10', '--black-alpha-20'].forEach(
    (name) => root.style.removeProperty(name)
  );
});

describe('LineChart year filtering', () => {
  it('defaults to the current year on mount (sorted by month) and excludes 2022 when "all years" is selected', () => {
    renderChart();

    // Mount effect sets selectedYear to the current year (2024, fixed by
    // fake system time) -- only the two 2024 rows, sorted by month.
    let props = readLineProps();
    expect(props.data.labels).toEqual(['jan', 'mar']);
    expect(props.data.datasets[0].data).toEqual([10, 300]); // incomes
    expect(props.data.datasets[1].data).toEqual([5, 90]); // expenses

    // Selecting "allYears" (value '') switches to the branch that excludes
    // year 2022 specifically, sorted by year then month.
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    props = readLineProps();
    expect(props.data.labels).toEqual(['may', 'jan', 'mar']);
    expect(props.data.datasets[0].data).toEqual([200, 10, 300]);
    expect(props.data.datasets[1].data).toEqual([80, 5, 90]);
  });

  it('lists every distinct year present in dataI as a <select> option', () => {
    renderChart();
    const options = screen.getAllByRole('option').map((o) => o.value);
    expect(options).toEqual(['', '2022', '2023', '2024']);
  });
});

describe('LineChart CSS-variable color resolution', () => {
  it('resolves chart colors from CSS custom properties for light mode', () => {
    renderChart({}, { isDarkMode: false });
    const props = readLineProps();

    expect(props.data.datasets[0].borderColor).toBe('rgb(1, 2, 3)');
    expect(props.data.datasets[0].backgroundColor).toBe('rgba(1, 2, 3, 0.5)');
    expect(props.data.datasets[1].borderColor).toBe('rgb(4, 5, 6)');
    expect(props.options.plugins.legend.labels.color).toBe('#111111');
    expect(props.options.plugins.tooltip.backgroundColor).toBe('rgba(1, 1, 1, 0.9)');
    // Light mode reads the --black-alpha-* variables for grid/tick colors.
    expect(props.options.scales.x.grid.color).toBe('rgba(5, 5, 5, 0.1)');
    expect(props.options.scales.x.border.color).toBe('rgba(6, 6, 6, 0.2)');
  });

  it('re-runs the resolveColors effect and switches to the --white-alpha-* variables when isDarkMode changes', () => {
    const { rerender } = renderChart({}, { isDarkMode: false });
    expect(readLineProps().options.scales.x.grid.color).toBe('rgba(5, 5, 5, 0.1)');

    rerender(
      <GlobalContext.Provider value={{ isDarkMode: true }}>
        <LineChart dataI={dataI} height={300} t={t} />
      </GlobalContext.Provider>
    );

    // Dark mode reads the --white-alpha-* variables instead -- proves the
    // effect actually re-ran (it's keyed on [isDarkMode]) rather than
    // freezing colors from the first resolution, which is exactly the gap
    // Phase 1 found in the superseded, deleted chartOptions.js.
    expect(readLineProps().options.scales.x.grid.color).toBe('rgba(2, 2, 2, 0.1)');
    expect(readLineProps().options.scales.x.border.color).toBe('rgba(3, 3, 3, 0.2)');
  });
});
