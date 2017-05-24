/**
 * @author Anthony Altieri on 5/24/17.
 */

const loremIpsumShort = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
const loremIpsumMedium = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
const loremIpsumLong = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

const picUrl = 'https://avatars1.githubusercontent.com/u/8461581?v=3&s=88';


const comments = [
  {
    username: 'AnthonyAltieri',
    content: loremIpsumShort,
    picUrl,
  },
  {
    username: 'John Doe',
    content: loremIpsumMedium,
    picUrl,
  },
  {
    username: 'AnthonyAltieri',
    content: loremIpsumLong,
    picUrl,
  },
  {
    username: 'Jane Doe',
    content: loremIpsumShort,
    picUrl,
  },
];


export function getComments(sourceCodeUrl) {
  return comments;
}

export default {
  getComments,
}
