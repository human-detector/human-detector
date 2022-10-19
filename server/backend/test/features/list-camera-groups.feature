Feature: Listing a user's camera groups

  Scenario: User is viewing their camera groups from the app
    Given I have credentials
    When I request a list of my camera groups
    Then I receive my camera groups, including the list of cameras associated with each group

  Scenario: User A is attempting to list another user B's camera groups
    Given I have user A's credentials
    When I request user B's camera groups
    Then I receive an unauthorized error

  Scenario: User A is attempting to list the camera groups of user B, a non-existent user
    Given I have user A's credentials
    When I request user B's camera groups
    Then I receive an unauthorized error

  Scenario: User is attempting to view their camera groups with an expired token
    Given I have user A's expired credentials
    When I request user A's camera groups
    Then I receive an unauthorized error
