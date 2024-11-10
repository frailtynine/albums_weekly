def increase_counter(model, counter_model):
    view_counter = counter_model.objects.get_or_create(object=model)[0]
    view_counter.count += 1
    view_counter.save()