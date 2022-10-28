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
    Then I receive an unauthorized error
  
  Scenario: User is attempting to register a camera with no serial
    Given I have user A's credentials
    When I register the camera through the app with no serial
    Then I receive a bad request error

  Scenario: User is attempting to register a camera with no name
    Given I have user A's credentials
    When I register the camera through the app with no name
    Then I receive a bad request error

  Scenario: User is attempting to register a camera with no public key
    Given I have user A's credentials
    When I register the camera through the app with no public key
    Then I receive a bad request error
