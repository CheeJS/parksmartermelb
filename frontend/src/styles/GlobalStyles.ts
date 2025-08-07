import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #F8FAFC;
    color: #1A202C;
    line-height: 1.5;
  }

  button {
    font-family: inherit;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #F1F1F1;
  }

  ::-webkit-scrollbar-thumb {
    background: #CBD5E0;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #A0AEC0;
  }
`;

export default GlobalStyles;