keysleft unit tests
========

Unit tests for the keysleft website

Just open the test-runner.html file in your favourite browser to run the unit tests. 

The test runner is a container for both unit tests and the actual code under test (all included with script tags). The framework used is QUnit and you will find the source code in the "qunit" folder.

The unit tests are found in "url-tests.js" and "viewmodel-test.js".

The production code has a dependency to a global object "ko" (knockout.js), and that dependency need to be mocked/stubbed to be able to write unit tests for the keysleft view model. Currently there is a very simple "stub" written for the ko object within the viewmodel-test.js file. The stub is the one used by the view model in the unit testing context (instead of the real knockout.js code).


Here is a 15 minute video with an example on how test driven development can be done with JavaScript:
http://youtu.be/MovVnuVDW_4
