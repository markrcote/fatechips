module Types
  class MutationType < Types::BaseObject
    field(:take_chip, mutation: Mutations::TakeChip)
  end
end
