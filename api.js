const request = require('request');
require('dotenv').config();

module.exports = function (req, res, next) {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY; // Use environment variable

    if (!apiKey) {
      return res.status(400).json('Missing environment variable: GOOGLE_SHEETS_API_KEY');
    }

    const params = req.query;
    const id = params.id;
    const sheet = params.sheet;
    const query = params.q;
    const useIntegers = params.integers || true;
    const showRows = params.rows || true;
    const showColumns = params.columns || true;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${sheet}?key=${apiKey}`;

    request(url, function (error, response, body) {
      if (!id) {
        return res.status(response.statusCode).json('You must provide a sheet ID');
      }

      if (!sheet) {
        return res.status(response.statusCode).json('You must provide a sheet name');
      }

      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body);
        const responseObj = {};
        const rows = [];
        const columns = {};

        if (data && data.values) {
          const headings = data.values[0];

          for (let i = 1; i < data.values.length; i++) {
            const entry = data.values[i];
            const newRow = {};
            let queried = false; // Use `let` for mutability

            for (let j = 0; j < entry.length; j++) {
              const name = headings[j];
              const value = entry[j];

              if (query) {
                queried = value.toLowerCase().indexOf(query.toLowerCase()) > -1;
              }

              if (Object.keys(params).indexOf(name) > -1) {
                queried = value.toLowerCase() === params[name].toLowerCase();
              }

              if (useIntegers === true && !isNaN(value)) {
                value = Number(value);
              }

              newRow[name] = value;

              if (queried === true) {
                if (!columns.hasOwnProperty(name)) {
                  columns[name] = [];
                }
                columns[name].push(value);
              }
            }

            if (queried === true) {
              rows.push(newRow);
            }
          }

          if (showColumns === true) {
            responseObj['columns'] = columns;
          }

          if (showRows === true) {
            responseObj['rows'] = rows;
          }

          return res.status(200).json(responseObj);
        } else {
          const parsedData = JSON.parse(response.body);
          return res.status(response.statusCode).json(parsedData.error);
        }
      } else {
        const parsedData = JSON.parse(response.body);
        return res.status(response.statusCode).json(parsedData.error);
      }
    });
  } catch (error) {
    const parsedData = JSON.parse(response.body);
    return res.status(response.statusCode).json(parsedData.error);
  }
};