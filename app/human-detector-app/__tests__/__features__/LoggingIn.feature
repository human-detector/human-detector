Feature: Logging in

Scenario: Entering correct username and password
    Given I have an account
    When I enter my username correctly
    And enter my password correctly
    Then I should be authorized to have access to the application

Scenario: Entering incorrect username but correct password
    Given I have an account
    When I enter my username incorrectly
    And enter my password correctly
    Then I should not have authorized access to the application

Scenario: Entering incorrect username and password 
    Given I have an account
    When I enter my username incorrectly
    And enter my password incorrectly
    Then I should not have authorized access to the application

