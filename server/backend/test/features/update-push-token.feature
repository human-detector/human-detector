Feature: Updating a user's Expo push token

  Scenario: Updating after login
    Given I have a new Expo push token
    And I am logged in
    When I try to update my push token
    Then It succeeds
    And My push token has been updated

  Scenario: Updating without credentials
    Given I have a new Expo push token
    And I am not logged in
    When I try to update my push token
    Then It fails with an unauthorized error
    And My push token has not been updated

  Scenario: Updating a non-existent user's token
    Given I have a new Expo push token
    And I have a bogus user ID
    When I try to update their push token
    Then It fails with a forbidden error
