class GamesController < ApplicationController
  def index
    @games = Game.all
  end

  def new
    @game = Game.new
  end

  def show
    @game = Game.find(params[:id])
  end

  def create
    @game = Game.new(name: params[:name])
    chip_pool = ChipPool.create
    params.keys.select {|param| param.start_with?("chip_")}.each do |param|
      chip_type = param[5..-1]
      chip_count = params[param].to_i
      chip_count = ChipCount.create(
        count: params[param].to_i,
        chip_type: param[5..-1],
        chip_pool_id: chip_pool.id
      )
      chip_count.save
    end
    @game.chip_pool_id = chip_pool.id
    if @game.save
      redirect_to @game
    else
      render 'new'
    end
  end

  def take
    @game = Game.find(params[:id])
    taken = @game.take_chip
    if taken.nil?
      @take_text = "No chips to take!"
    else
      @take_text = "Took a #{taken.chip_type} chip."
    end
  end
end
