Feature: Receiving push notifications

Scenario: Camera senses a detection
    Given I am not home
    When my camera senses a detection
    And I have push notifications on
    And the snooze setting isn't on
    Then I will receive a push notification

Scenario: Camera doesn't sense a detection 
    Given I am not home
    When my camera doesn't sense a detection
    And I have push notifications on
    And the snooze setting isn't on
    Then I will not receive a push notification

Scenario: Snooze on
    Given I am home
    When my camera senses a detection
    And the snooze setting is on
    Then I will not receive a push notification