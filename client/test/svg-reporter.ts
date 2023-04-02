import fs from 'fs/promises';
import path from 'path';

// eslint-disable-next-line no-undef
const svgsFolder = 'dist/test/svg/';
// eslint-disable-next-line no-undef
const reportFolder = 'reports/svg-report';

const htmlTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      li{
        list-style: none;
      }
      li> div {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      li> div>img {
        width: calc(50% - 10px);
        margin: 5px;
      }
    </style>
  </head>
  <body>
    <h2>Actual(left) expected(right)</h2>
    {{BODY}}
  </body>
</html>
`;

type Case = {
  name: string;
  actual: string;
  expected: string;
};

export default class SVGReporter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  async onFinished(files, errors) {
    await Promise.all([
      fs.readdir(svgsFolder),
      fs.mkdir(reportFolder, { recursive: true })
    ]).then(([list]) => {
      const cases = list
        .filter((filename) => filename.endsWith('.svg'))
        .reduce((cases, filename, i) => {
          const match = filename.match(/^(.*)-(actual|expected)\.svg$/);
          if (!match || match.length !== 3) {
            return cases;
          }
          const c = match[1];
          const type = match[2] as 'actual' | 'expected';
          if (!cases[c]) {
            cases[c] = {
              name: c,
              actual: '',
              expected: ''
            };
          }
          cases[c][type] = filename;
          return cases;
        }, {} as Record<string, Case>);
      const validCases = Object.values(cases).filter(
        (c) => c.actual && c.expected
      );
      const lis = validCases.reduce((html, c) => {
        return (
          html +
          `
            <li>
              <h3>${c.name}</h3>
              <div>
                <img src=./${c.actual} />
                <img src=./${c.expected} />
              </div>
            </li>
            `
        );
      }, '');

      return Promise.all([
        fs.writeFile(
          path.resolve(reportFolder, 'index.html'),
          htmlTemplate.replace('{{BODY}}', `<ul>${lis}</ul>`)
        ),
        ...validCases.reduce((promises, c) => {
          return promises.concat([
            fs.copyFile(
              path.resolve(svgsFolder, c.actual),
              path.resolve(reportFolder, c.actual)
            ),
            fs.copyFile(
              path.resolve(svgsFolder, c.expected),
              path.resolve(reportFolder, c.expected)
            )
          ]);
        }, [] as Promise<void>[])
      ]);
    });
  }
}
