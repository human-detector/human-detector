Feature: Register a camera to a user

  Scenario: User is registering their camera from the app
    Given I have credentials
    When I register the camera through the app
    Then I receive the camera ID
    And The camera is registered

  Scenario: User A is attempting to register a camera to User B
    Given I have user A's credentials
    When I register the camera to user B
    Then I receive an unauthorized error

  Scenario: User A is attempting to register a camera to a non-existant User B
    Given I have user A's credentials
    When I register the camera to user B
    Then I receive an unauthorized error

  Scenario: User is attempting to register a camera to a non-existant Group
    Given I have user A's credentials
    When I register the camera through the app with a non-existant Group
    Then I receive a not found error
  
  Scenario: User is attempting to register a camera with no Serial
    Given I have user A's credentials
    When I register the camera through the app with no Serial
    Then I receive a bad request error

  Scenario: User is attempting to register a camera with no UUID
    Given I have user A's credentials
    When I register the camera through the app with no UUID
    Then I receive a bad request error

  Scenario: User is attempting to register a camera with no Public Key
    Given I have user A's credentials
    When I register the camera through the app with no Public Key
    Then I receive a bad request error
