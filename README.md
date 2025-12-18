# Dominik-Coffee-Mug-Homework

Playwright E2E test framework for Magneto E-commerce 

## Overview

This is an implementation of one E2E test scenario including base functionalities as in homework doc.

**Configuration**: Test data stored in `.env` file. The default user exists even after the data is cleaned.  
**Custom data**: To use your own data, please create new user on [Test e-commerce platform](https://demo-magento-2.auroracreation.com/en/) and update credentials in `.env`.  
**Note**: Store data cleaned every 6 hours (at 6:00, 12:00, 18:00, and 0:00 CET).

## Requirements

To run this project locally, install:

- **Node.js**
- **Playwright**  
  [Playwright documentation](https://playwright.dev/docs/intro)

## Project Setup

```
npm init playwright@latest
```

## Run tests

```
npx playwright test
```

## Generate report

```
npx playwright --report
```

**Report location**: `/playwright-report/index.html`

## Contact

For problems or questions:  
**dominikn911@gmail.com**
