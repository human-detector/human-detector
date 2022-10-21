Feature: Sending a notification

  Scenario: Sending without credentials
    Given I have no credentials
    And Camera A has 3 notifications
    When I try to send a notification for camera A
    Then I receive an 'Unauthorized' error
    And Camera A has 3 notifications

  Scenario: Sending to an invalid camera ID
    Given I have camera A's credentials
    And Camera C is not registered
    When I try to send a notification using camera C's ID
    Then I recieve a 'Forbidden' error

  Scenario: Attempting to send a notification on behalf of camera B using camera A's credentials
    Given I have camera A's credentials
    And Camera B has 2 notifications
    When I try to send a notification on behalf of camera B
    Then I recieve a 'Forbidden' error
    And Camera B has 2 notifications

  Scenario: Sending a notification with valid credentials
    Given I have camera A's credentials
    And Camera A has 1 notification
    When I try to send a notification on behalf of camera A
    Then The request succeeded
    And Camera A has 2 notifications
