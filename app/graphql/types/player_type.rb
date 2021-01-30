module Types
  class PlayerType < Types::BaseObject
    description("A player in a particular game")
    field(:id, ID, null: false)
    field(:user, Types::UserType, null: false)
    field(:chip_pool, Types::ChipPoolType, null: true)
  end
end
