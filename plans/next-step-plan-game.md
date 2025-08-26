# Plan for Improving the Overall Performance of the System

## Notes

-
-
-
-
-


------------------------------------------------------------------------------

## Task List

- [x] Add lazy loading for all the page throughout the app wherever the loading is required.

- [x] Rename all the routes to the app to remove the numbers. Ex: `/games/02-Archery-Game` -> `/games/Archery-Game`

- [x] Link all the game routes to the game cards in the landing page.

- [x] Test all the the games. Fix the errors when found.

- [] Add a header with navigation to home page. Also add a footer to each game.  

- [] Make the minimum necessary page in a website like `about`, `contact`, `privacy`, `T&C`, etc.

- [] Generate AI image of each games to add to the cards. Make a place holder image also.

- [] Make all the important detailed Docs. Ex: `doc for steps by step guide how to add new game?`

- [] Give me a list of outdated file and folder that are safe(does not effect the current codebase) to delete.


------------------------------------------------------------------------------
Error: 

```
aim@http://localhost:9002/games/02-Archery-Game line 231 > injectedScript:50:9
@http://localhost:9002/games/02-Archery-Game line 231 > injectedScript:23:10
ArcheryGame.useEffect@http://localhost:9002/_next/static/chunks/_5a92e714._.js:231:27
ClientPageRoot@http://localhost:9002/_next/static/chunks/node_modules_next_dist_1a6ee436._.js:2061:50
```

The Archery Game failed due to a race condition in script loading. The useEffect hook dynamically injected
  TweenMax, MorphSVGPlugin, and game logic. However, the game logic often executed before its dependencies fully
  loaded, causing "undefined" errors like with the aim function. My fix involves statically including external
  scripts in the HTML with defer, integrating the game logic directly into useEffect, and implementing a
  checkAndRunGame function that retries execution until TweenMax and MorphSVGPlugin are confirmed loaded,
  ensuring proper dependency management and cleanup.

Suggestion: refer @static-code/02-Archery-Game/ and fix the error. try to avoid error loops.

- 
- 



