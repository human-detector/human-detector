Feature: Getting a snapshot image

  Scenario: Authenticated user requests a snapshot from the backend
    Given I have authorization
    And One of my cameras has an available snapshot
    When I request a snapshot
    Then I receive the image data

  Scenario: Authenticated user fetches a non-existent snapshot
    Given I have authorization
    When I request a non-existent snapshot
    Then I receive a "Forbidden" error

  Scenario: Authenticated user attempting to fetch a snapshot they do not own
    Given I am authorized as user A
    And User B has a snapshot
    When I request user B's snapshot as user A
    Then I receive a "Forbidden" error

  Scenario: Unauthenticated client attempting to fetch a snapshot
    Given I am unauthenticated
    And User A has a snapshot
    When I request user A's snapshot
    Then I receive an "Unauthenticated" error
